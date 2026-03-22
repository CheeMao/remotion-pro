#!/usr/bin/env python3
# TTS 语音合成脚本
# 用法: python tts_synthesize.py --voice "声音ID" --text "要合成的文本" --output "输出文件.mp3"

import os
import sys
import argparse

try:
    import dashscope
    from dashscope.audio.tts_v2 import SpeechSynthesizer
except ImportError:
    print("请先安装 dashscope: pip install dashscope")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='TTS 语音合成')
    parser.add_argument('--voice', required=True, help='声音ID')
    parser.add_argument('--text', required=True, help='要合成的文本')
    parser.add_argument('--output', default='output.mp3', help='输出文件路径')
    parser.add_argument('--model', default='cosyvoice-v3.5-plus', help='模型名称')
    parser.add_argument(
        '--speech-rate',
        type=float,
        default=1.0,
        help='语速倍率，范围 0.5 到 2.0，1.0 为默认语速'
    )
    args = parser.parse_args()

    if args.speech_rate < 0.5 or args.speech_rate > 2.0:
        import json
        print(json.dumps({
            'success': False,
            'error': 'speech_rate must be between 0.5 and 2.0'
        }))
        sys.exit(1)

    # 设置 API Key
    api_key = os.getenv('DASHSCOPE_API_KEY')
    if not api_key:
        print("错误: 请设置 DASHSCOPE_API_KEY 环境变量")
        sys.exit(1)

    dashscope.api_key = api_key
    dashscope.base_websocket_api_url = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference'
    dashscope.base_http_api_url = 'https://dashscope.aliyuncs.com/api/v1'

    try:
        # 创建合成器并调用
        synthesizer = SpeechSynthesizer(
            model=args.model,
            voice=args.voice,
            speech_rate=args.speech_rate
        )
        audio_data = synthesizer.call(args.text)

        # 保存音频文件
        with open(args.output, 'wb') as f:
            f.write(audio_data)

        # 输出 JSON 结果供 Node.js 解析
        import json
        result = {
            'success': True,
            'output': args.output,
            'request_id': synthesizer.get_last_request_id()
        }
        print(json.dumps(result))

    except Exception as e:
        import json
        result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == '__main__':
    main()
