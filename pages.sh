STASH="satash before pages push"
MESSAGE="Updating bin/* with latest source-code"
BUNDLE="bin/Modularize.min.js"

git stash save "$STASH" && \
npx webpack && \
git add bin/* && \
git commit -m "$MESSAGE" && \
git checkout -b gh-pages && \
git checkout testing "$BUNDLE" && \
git commit -m "$MESSAGE" && \
git push origin gh-pages && \
git checkout testing && \
git stash pop $(git stash list | grep "$STASH" | cut -d: -f1) && \
echo "all good!"
