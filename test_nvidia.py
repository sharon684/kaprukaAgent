from openai import OpenAI
import os
import sys

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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"
)

completion = client.chat.completions.create(
  model="z-ai/glm-5.2",
  messages=[{"role":"user","content":"Hello"}],
  temperature=1,
  top_p=1,
  max_tokens=100,
  seed=42,
  stream=True
)

for chunk in completion:
  if not getattr(chunk, "choices", None):
    continue
  if len(chunk.choices) == 0 or getattr(chunk.choices[0], "delta", None) is None:
    continue
  delta = chunk.choices[0].delta
  if getattr(delta, "content", None) is not None:
    print(delta.content, end="")
