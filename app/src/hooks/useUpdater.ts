/**
 * Tauri 应用增量更新系统
 * 核心功能：
 * 1. 检查更新 - 对比本地版本和服务器版本
 * 2. 下载差异包 - 只下载变更的文件
 * 3. 增量更新 - 替换变更文件，保留未变更文件
 * 4. 重启应用 - 完成更新
 */

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  forceUpdate: boolean;
  downloadUrl: string;
  changelog?: string;
  fileSize?: number;
}

export interface UpdateProgress {
  status:
    | "idle"
    | "checking"
    | "available"
    | "downloading"
    | "verifying"
    | "ready"
    | "error";
  progress: number; // 0-100
  speed?: string; // 下载速度
  error?: string;
  downloadedSize?: number;
  totalSize?: number;
}

export interface PatchFile {
  path: string;
  hash: string;
  size: number;
  action: "add" | "update" | "delete";
}

export interface UpdateManifest {
  version: string;
  minimumVersion: string;
  files: PatchFile[];
  totalSize: number;
  changelog: string;
  signature: string;
}

export function useUpdater() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress>({
    status: "idle",
    progress: 0,
  });

  // 检查更新
  const checkUpdate = useCallback(async (): Promise<UpdateInfo | null> => {
    setProgress({ status: "checking", progress: 0 });

    try {
      // 调用 Rust 后端检查更新
      const info: UpdateInfo = await invoke("check_app_update");
      setUpdateInfo(info);

      if (info.hasUpdate) {
        setProgress({ status: "available", progress: 0 });
      } else {
        setProgress({ status: "idle", progress: 100 });
      }

      return info;
    } catch (error) {
      setProgress({
        status: "error",
        progress: 0,
        error: String(error),
      });
      return null;
    }
  }, []);

  // 下载并安装更新（增量更新）
  const downloadAndInstall = useCallback(async () => {
    if (!updateInfo?.hasUpdate) return;

    setProgress({ status: "downloading", progress: 0 });

    try {
      // 调用 Rust 后端执行增量更新
      await invoke("download_and_apply_update", {
        onProgress: (data: {
          progress: number;
          speed: string;
          downloaded: number;
          total: number;
        }) => {
          setProgress({
            status: "downloading",
            progress: data.progress,
            speed: data.speed,
            downloadedSize: data.downloaded,
            totalSize: data.total,
          });
        },
      });

      setProgress({ status: "ready", progress: 100 });
    } catch (error) {
      setProgress({
        status: "error",
        progress: 0,
        error: String(error),
      });
    }
  }, [updateInfo]);

  // 重启应用
  const restartApp = useCallback(async () => {
    await invoke("restart_app");
  }, []);

  // 立即更新（下载+重启）
  const updateAndRestart = useCallback(async () => {
    await downloadAndInstall();
    if (progress.status === "ready") {
      await restartApp();
    }
  }, [downloadAndInstall, progress.status, restartApp]);

  // 组件挂载时自动检查
  useEffect(() => {
    // 可以配置启动时是否自动检查
    const shouldCheckOnStartup =
      localStorage.getItem("update.checkOnStartup") !== "false";
    if (shouldCheckOnStartup) {
      checkUpdate();
    }
  }, [checkUpdate]);

  return {
    updateInfo,
    progress,
    checkUpdate,
    downloadAndInstall,
    restartApp,
    updateAndRestart,
  };
}

// 导出更新组件
export function UpdateNotification() {
  // 这里可以放置更新通知 UI 组件
  return null;
}
