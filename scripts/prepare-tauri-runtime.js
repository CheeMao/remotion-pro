#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { bundle } = require("@remotion/bundler");

const projectRoot = path.resolve(__dirname, "..");
const buildDir = path.join(projectRoot, ".sidecar-build");
const resourcesRoot = path.join(projectRoot, "src-tauri", "resources");
const runtimeDir = path.join(resourcesRoot, "runtime");
const bundleDir = path.join(runtimeDir, "remotion-bundle");
const binariesDir = path.join(projectRoot, "src-tauri", "binaries");
const packageJsonPath = path.join(projectRoot, "package.json");
const remotionConfigPath = path.join(projectRoot, "remotion.config.ts");
const nodeExecutable = process.execPath;
const npmExecutable = process.env.npm_execpath;
const ffmpegExecutable =
  process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
const ffprobeExecutable =
  process.platform === "win32" ? "ffprobe.exe" : "ffprobe";
const runtimeInstallDir = path.join(projectRoot, ".runtime-node");
const rootPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const runtimeDependencyNames = [
  "@remotion/bundler",
  "@remotion/google-fonts",
  "@remotion/renderer",
  "@remotion/zod-types",
  "commander",
  "music-metadata",
  "react",
  "react-dom",
  "remotion",
  "zod",
];
const typescriptCli = path.join(
  projectRoot,
  "node_modules",
  "typescript",
  "bin",
  "tsc"
);

const log = (message) => console.log(`[prepare-tauri-runtime] ${message}`);

const getInstalledDependencyVersion = (name) => {
  const packageJson = path.join(
    projectRoot,
    "node_modules",
    ...name.split("/"),
    "package.json"
  );

  if (!fs.existsSync(packageJson)) {
    throw new Error(
      `Installed dependency package.json was not found for ${name} at ${packageJson}`
    );
  }

  return JSON.parse(fs.readFileSync(packageJson, "utf8")).version;
};

const ensureCleanDir = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
};

const copyRecursive = (source, target) => {
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    dereference: true,
    filter: (src) => {
      const normalized = src.replace(/\\/g, "/");
      if (normalized.includes("/.cache/")) {
        return false;
      }
      if (normalized.includes("/.vite/")) {
        return false;
      }
      return true;
    },
  });
};

const detectRustTargetTriple = () => {
  const output = execFileSync("rustc", ["-Vv"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  const hostLine = output
    .split(/\r?\n/)
    .find((line) => line.toLowerCase().startsWith("host:"));

  if (!hostLine) {
    throw new Error("Unable to detect Rust host target triple.");
  }

  return hostLine.split(":")[1].trim();
};

const installRuntimeNodeModules = () => {
  if (!npmExecutable) {
    throw new Error("npm_execpath is unavailable. Cannot prepare runtime node_modules.");
  }

  ensureCleanDir(runtimeInstallDir);
  const runtimePackageJson = {
    name: "ai-remotion-runtime",
    private: true,
    version: rootPackageJson.version,
    description: "Packaged Remotion runtime for Tauri",
    dependencies: Object.fromEntries(
      runtimeDependencyNames.map((name) => {
        const declaredRange = rootPackageJson.dependencies?.[name];
        if (!declaredRange) {
          throw new Error(`Missing runtime dependency range for ${name}`);
        }

        const installedVersion = getInstalledDependencyVersion(name);
        log(
          `Pinning runtime dependency ${name} to installed version ${installedVersion} (declared ${declaredRange})`
        );
        return [name, installedVersion];
      })
    ),
  };
  fs.writeFileSync(
    path.join(runtimeInstallDir, "package.json"),
    `${JSON.stringify(runtimePackageJson, null, 2)}\n`
  );

  log("Installing production runtime node_modules...");
  execFileSync(
    nodeExecutable,
    [npmExecutable, "install", "--omit=dev", "--ignore-scripts"],
    {
      cwd: runtimeInstallDir,
      stdio: "inherit",
    }
  );
};

const resolveToolPath = (toolName) => {
  try {
    const command = process.platform === "win32" ? "where" : "which";
    const output = execFileSync(command, [toolName], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
  } catch {
    return null;
  }
};

const resolveRequiredToolPath = (toolName, envVarName) => {
  const configuredPath = process.env[envVarName];
  if (configuredPath) {
    const absolutePath = path.resolve(configuredPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(
        `${envVarName} points to a missing file: ${absolutePath}`
      );
    }

    return absolutePath;
  }

  const discoveredPath = resolveToolPath(toolName);
  if (discoveredPath) {
    return discoveredPath;
  }

  throw new Error(
    `Required binary ${toolName} was not found on PATH. Install ${toolName} or set ${envVarName} before running the Tauri build.`
  );
};

const prepareSidecarBinary = () => {
  const targetTriple = detectRustTargetTriple();
  const extension = process.platform === "win32" ? ".exe" : "";
  const outputPath = path.join(binariesDir, `cli-${targetTriple}${extension}`);

  fs.mkdirSync(binariesDir, { recursive: true });
  fs.copyFileSync(nodeExecutable, outputPath);
  log(`Copied Node runtime to ${outputPath}`);
};

const compileSidecarSources = () => {
  log("Compiling sidecar TypeScript sources...");
  execFileSync(nodeExecutable, [typescriptCli, "-p", "tsconfig.sidecar.json"], {
    cwd: projectRoot,
    stdio: "inherit",
  });
};

const buildRemotionBundle = async () => {
  log("Building Remotion bundle for packaged runtime...");
  await bundle({
    entryPoint: path.join(projectRoot, "src", "index.ts"),
    rootDir: projectRoot,
    publicDir: path.join(projectRoot, "public"),
    outDir: bundleDir,
  });
};

const copyRuntimeFiles = () => {
  log("Copying compiled runtime files...");
  copyRecursive(buildDir, path.join(runtimeDir, "app"));

  log("Copying runtime node_modules...");
  copyRecursive(
    path.join(runtimeInstallDir, "node_modules"),
    path.join(runtimeDir, "node_modules")
  );

  fs.copyFileSync(packageJsonPath, path.join(runtimeDir, "package.json"));
  fs.copyFileSync(remotionConfigPath, path.join(runtimeDir, "remotion.config.ts"));

  const ffmpegDir = path.join(runtimeDir, "ffmpeg");
  fs.mkdirSync(ffmpegDir, { recursive: true });

  const ffmpegPath = resolveRequiredToolPath(ffmpegExecutable, "FFMPEG_PATH");
  fs.copyFileSync(ffmpegPath, path.join(ffmpegDir, ffmpegExecutable));
  log(`Copied ffmpeg binary from ${ffmpegPath}`);

  const ffprobePath = resolveRequiredToolPath(ffprobeExecutable, "FFPROBE_PATH");
  fs.copyFileSync(ffprobePath, path.join(ffmpegDir, ffprobeExecutable));
  log(`Copied ffprobe binary from ${ffprobePath}`);

  // Copy Python TTS scripts
  const srcScriptsDir = path.join(projectRoot, 'scripts');
  const dstScriptsDir = path.join(runtimeDir, 'scripts');
  fs.mkdirSync(dstScriptsDir, { recursive: true });
  const pythonScripts = fs.readdirSync(srcScriptsDir).filter((f) => f.endsWith('.py'));
  for (const script of pythonScripts) {
    fs.copyFileSync(path.join(srcScriptsDir, script), path.join(dstScriptsDir, script));
  }
  log(`Copied ${pythonScripts.length} Python scripts to runtime/scripts/`);
};

async function main() {
  log("Preparing packaged runtime...");
  ensureCleanDir(buildDir);
  ensureCleanDir(runtimeDir);
  ensureCleanDir(runtimeInstallDir);

  compileSidecarSources();
  installRuntimeNodeModules();
  await buildRemotionBundle();
  copyRuntimeFiles();
  prepareSidecarBinary();
  fs.rmSync(runtimeInstallDir, { recursive: true, force: true });

  log("Packaged runtime is ready.");
}

main().catch((error) => {
  console.error(`[prepare-tauri-runtime] Failed: ${error.stack || error.message}`);
  process.exit(1);
});
