#!/usr/bin/env python3

import argparse
import json
import os
import sys

try:
    import dashscope
    from dashscope.audio.tts_v2 import SpeechSynthesizer
except ImportError:
    print(json.dumps({"success": False, "error": "Please install dashscope: pip install dashscope"}))
    sys.exit(1)


def fail(message: str, request_id: str | None = None) -> None:
    payload = {"success": False, "error": message}
    if request_id:
        payload["request_id"] = request_id
    print(json.dumps(payload, ensure_ascii=False))
    sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Synthesize speech with DashScope TTS")
    parser.add_argument("--voice", required=True, help="Voice ID")
    parser.add_argument("--text", required=True, help="Text to synthesize")
    parser.add_argument("--output", default="output.mp3", help="Output audio path")
    parser.add_argument("--model", default="cosyvoice-v3.5-plus", help="Model name")
    parser.add_argument(
        "--speech-rate",
        type=float,
        default=1.0,
        help="Speech rate multiplier, between 0.5 and 2.0",
    )
    args = parser.parse_args()

    if args.speech_rate < 0.5 or args.speech_rate > 2.0:
        fail("speech_rate must be between 0.5 and 2.0")

    text = args.text.strip()
    if not text:
        fail("Input text is empty.")

    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        fail("DASHSCOPE_API_KEY is required.")

    dashscope.api_key = api_key
    dashscope.base_websocket_api_url = "wss://dashscope.aliyuncs.com/api-ws/v1/inference"
    dashscope.base_http_api_url = "https://dashscope.aliyuncs.com/api/v1"

    try:
        synthesizer = SpeechSynthesizer(
            model=args.model,
            voice=args.voice,
            speech_rate=args.speech_rate,
        )
        audio_data = synthesizer.call(text)
        request_id = (
            synthesizer.get_last_request_id()
            if hasattr(synthesizer, "get_last_request_id")
            else None
        )

        if not isinstance(audio_data, (bytes, bytearray)) or len(audio_data) == 0:
            fail(
                "TTS provider returned no audio data. Please verify the input text and voice settings.",
                request_id,
            )

        with open(args.output, "wb") as output_file:
            output_file.write(audio_data)

        print(
            json.dumps(
                {
                    "success": True,
                    "output": args.output,
                    "request_id": request_id,
                },
                ensure_ascii=False,
            )
        )
    except Exception as exc:
        request_id = None
        try:
            request_id = (
                synthesizer.get_last_request_id()
                if "synthesizer" in locals() and hasattr(synthesizer, "get_last_request_id")
                else None
            )
        except Exception:
            request_id = None
        fail(str(exc), request_id)


if __name__ == "__main__":
    main()
