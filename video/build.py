#!/usr/bin/env python3
import subprocess, os, sys

V = os.path.dirname(os.path.abspath(__file__))
os.chdir(V)
SEGS = ["s0_title", "s2_pipeline", "s3_runresearch", "s4_brief", "s5_signals", "s6_work"]
os.makedirs("segvid", exist_ok=True)

def run(cmd):
    subprocess.run(cmd, check=True)

def dur(path):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path]).strip())

vlist, alist = [], []
for s in SEGS:
    a_in = f"audio/{s}.wav"
    a_out = f"segvid/{s}_a.wav"
    run(["ffmpeg", "-y", "-v", "error", "-i", a_in,
         "-af", "adelay=600|600,apad=pad_dur=1.4,aresample=48000", a_out])
    d = dur(a_out)
    v_out = f"segvid/{s}_v.mp4"
    # letterbox the full screenshot into 1080p on a dark ground — nothing cropped
    vf = ("scale=1836:-2,"
          "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0F1420,"
          "format=yuv420p")
    run(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", f"shots/{s}.jpg",
         "-t", f"{d:.3f}", "-vf", vf, "-r", "30", v_out])
    vlist.append(v_out)
    alist.append(a_out)
    print(f"{s}: {d:.2f}s")

with open("concat.txt", "w") as f:
    for p in vlist:
        f.write(f"file '{os.path.join(V, p)}'\n")
with open("aconcat.txt", "w") as f:
    for p in alist:
        f.write(f"file '{os.path.join(V, p)}'\n")

run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
     "-i", "concat.txt", "-c", "copy", "segvid/video.mp4"])
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
     "-i", "aconcat.txt", "-c", "copy", "segvid/audio.wav"])
run(["ffmpeg", "-y", "-v", "error", "-i", "segvid/video.mp4", "-i", "segvid/audio.wav",
     "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "192k", "-shortest", "dossier_demo.mp4"])

info = subprocess.check_output(
    ["ffprobe", "-v", "error", "-show_entries",
     "format=duration,size", "-of", "default=nw=1", "dossier_demo.mp4"]).decode()
print("---\n" + info)
