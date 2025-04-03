root=$(pwd)

for example in vue-vanilla vue-hydration vue-next vue-streaming vue-vanilla-spa; do
  cd "${root}/${example}"
  node --test
  sleep 1
done