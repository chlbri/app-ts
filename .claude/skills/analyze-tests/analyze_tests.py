indent = "    "  # 4 spaces — adjust to the nesting level
tests = [
    "test('#01 => ...', () => expect(...).toBe(...));",
    # add one entry per test, written as a single-line string
]
for t in tests:
    n = len(indent + t)
    mark = "SINGLE" if n <= 75 else "MULTI"
    print(f"{n:3d} [{mark}]: {t[:70]}")
