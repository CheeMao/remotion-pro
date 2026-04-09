#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import base64
import io
import json
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def fail(message: str) -> None:
    print(json.dumps({"success": False, "error": message}, ensure_ascii=False))
    sys.exit(1)


def normalize_request_payload(payload: dict) -> dict:
    req_params = payload.get("req_params")
    if not isinstance(req_params, dict):
        return payload

    # Compatible with both old payload(text) and official demo payload(ssml).
    text_value = req_params.get("text")
    ssml_value = req_params.get("ssml")
    if (not ssml_value) and isinstance(text_value, str) and text_value.strip():
        req_params["ssml"] = text_value

    # Official sample sends additions as JSON string.
    if not req_params.get("additions"):
        audio_params = req_params.get("audio_params")
        enable_timestamp = False
        if isinstance(audio_params, dict):
            enable_timestamp = bool(audio_params.get("enable_timestamp"))

        req_params["additions"] = json.dumps(
            {
                "explicit_language": "zh",
                "disable_markdown_filter": True,
                "enable_timestamp": enable_timestamp,
            },
            ensure_ascii=False,
        )

    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="VolcEngine TTS synthesis")
    parser.add_argument("--request", required=True, help="Request payload JSON")
    parser.add_argument("--output", required=True, help="Output audio path")
    args = parser.parse_args()

    app_id = os.getenv("VOLCENGINE_APP_ID")
    access_key = os.getenv("VOLCENGINE_ACCESS_KEY")
    resource_id = os.getenv("VOLCENGINE_RESOURCE_ID", "seed-tts-1.0")

    if not app_id or not access_key:
        fail("VOLCENGINE_APP_ID and VOLCENGINE_ACCESS_KEY are required")

    try:
        request_data = json.loads(args.request)
    except json.JSONDecodeError as exc:
        fail(f"Invalid request JSON: {exc}")

    request_data = normalize_request_payload(request_data)

    try:
        import requests
    except ImportError:
        fail("Please install requests: pip install requests")

    url = "https://openspeech.bytedance.com/api/v3/tts/unidirectional"
    headers = {
        "X-Api-App-Id": app_id,
        "X-Api-Access-Key": access_key,
        "X-Api-Resource-Id": resource_id,
        "Content-Type": "application/json",
        "Connection": "keep-alive",
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=request_data,
            stream=True,
            timeout=60,
        )

        if response.status_code != 200:
            fail(f"API request failed: {response.status_code} - {response.text}")

        audio_chunks = []
        timestamps = None
        duration = 0
        error_data = None

        for line in response.iter_lines():
            if not line:
                continue

            try:
                data = json.loads(line.decode("utf-8"))
            except json.JSONDecodeError:
                continue

            code = data.get("code", 0)

            if code == 0 and data.get("data"):
                audio_chunks.append(base64.b64decode(data["data"]))
                continue

            if code == 0 and data.get("sentence"):
                sentence = data["sentence"]
                if sentence.get("words"):
                    timestamps = [
                        {
                            "word": w.get("word", ""),
                            "startTime": w.get("startTime", 0),
                            "endTime": w.get("endTime", 0),
                            "confidence": w.get("confidence", 1.0),
                        }
                        for w in sentence["words"]
                    ]
                    if timestamps:
                        duration = timestamps[-1]["endTime"]
                continue

            if code == 20000000:
                break

            if code and code > 0:
                error_data = data
                break

        if not audio_chunks:
            if error_data is not None:
                fail(
                    "No audio data received. Upstream error: "
                    + json.dumps(error_data, ensure_ascii=False)
                )
            fail("No audio data received")

        full_audio = b"".join(audio_chunks)

        output_dir = os.path.dirname(args.output)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        with open(args.output, "wb") as f:
            f.write(full_audio)

        timestamp_path = args.output.replace(".mp3", "_timestamps.json")
        with open(timestamp_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "timestamps": timestamps or [],
                    "duration": duration,
                },
                f,
                ensure_ascii=False,
                indent=2,
            )

        print(
            json.dumps(
                {
                    "success": True,
                    "output": args.output,
                    "duration": duration,
                    "timestamps": timestamps or [],
                },
                ensure_ascii=False,
            )
        )

    except Exception as exc:
        fail(f"TTS synthesis failed: {exc}")


if __name__ == "__main__":
    main()
