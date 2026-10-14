"""Exercise the real bootstrap CLI with private fixture input and a disposable PTY."""
import json
import os
import pty
import select
import subprocess
import sys
import termios
import time


def run():
    """Send hidden input only after prompts; check exit, no echo and terminal restoration."""
    with open(sys.argv[1], encoding="utf-8") as source:
        fixture = json.load(source)
    args = [fixture["node"], fixture["cli"], sys.argv[2], fixture["loginId"]]
    if sys.argv[2] == "replace":
        args += ["--expected-version", "1"]
    master, slave = pty.openpty()
    before = termios.tcgetattr(slave)
    child = subprocess.Popen(args, stdin=slave, stdout=slave, stderr=slave,
                             env={**os.environ, **fixture["env"]})
    output = b""
    stage = 0
    try:
        deadline = time.monotonic() + 30
        while child.poll() is None and time.monotonic() < deadline:
            if select.select([master], [], [], 0.05)[0]:
                output += os.read(master, 65536)
            prompts = [b"Password: ", b"Confirm password: "]
            if stage < 2 and prompts[stage] in output:
                os.write(master, (fixture["password"] + "\r").encode())
                stage += 1
        if child.poll() is None:
            child.kill()
            raise AssertionError("Bootstrap PTY deadline")
        while select.select([master], [], [], 0)[0]:
            output += os.read(master, 65536)
        expected = sys.argv[3] if len(sys.argv) > 3 else "completed"
        assert expected.encode() in output, "Bootstrap result mismatch"
        assert fixture["password"].encode() not in output, "Bootstrap secret echo"
        assert termios.tcgetattr(slave) == before, "Bootstrap terminal state"
        assert child.returncode == (0 if expected == "completed" else 1), "Bootstrap exit"
        print("Bootstrap PTY verified: result, no echo, terminal restored")
    finally:
        if child.poll() is None:
            child.kill()
        child.wait()
        os.close(master)
        os.close(slave)


if __name__ == "__main__":
    run()
