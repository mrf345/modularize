git stash --quiet
npx webpack
git add bin/*
git commit -m 'Updating bin/* with latest source-code'
git checkout gh-pages
git checkout testing bin/*
git commit -m 'Updating bin/* with latest source-code'
git push origin gh-pages
git checkout testing
git stash apply --quiet
echo "all good!"
