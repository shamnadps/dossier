# Demo video build

`build.py` assembles `dossier_demo.mp4` — a ~2 min narrated walkthrough:
a title card + real screenshots of the live app, cut to a voiceover.

## Inputs (not committed)
- `shots/s0_title.jpg` … `s6_work.jpg` — screenshots (title card rendered from `title.html`)
- `audio/*.wav` — narration, one file per segment

## Narration
Synthesised with Google Cloud Text-to-Speech, voice `en-US-Studio-Q`:

```sh
# needs: gcloud auth with Cloud TTS API enabled on the project
TOKEN=$(gcloud auth print-access-token)
curl -s https://texttospeech.googleapis.com/v1/text:synthesize \
  -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: <PROJECT>" \
  -H 'Content-Type: application/json' \
  -d '{"input":{"text":"..."},"voice":{"languageCode":"en-US","name":"en-US-Studio-Q"},
       "audioConfig":{"audioEncoding":"LINEAR16","sampleRateHertz":24000}}'
```

Segment text is in `narration.md`.

## Assemble
```sh
python3 build.py   # needs ffmpeg
```
