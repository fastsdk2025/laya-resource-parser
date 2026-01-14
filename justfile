ROOT := `git rev-parse --show-toplevel`
BIN := join(ROOT, "node_modules", ".bin")

default: build

build:
  @echo "Building..."
  @{{BIN}}/tsup --minify

dev:
  @echo "Starting development server..."
  @{{BIN}}/tsup --watch --sourcemap
