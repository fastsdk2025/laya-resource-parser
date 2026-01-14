async function main() {
  console.log("Hello, World!!!");
}

main().catch(err => {
  console.error("An error occurred:", err);
  process.exit(1);
})
