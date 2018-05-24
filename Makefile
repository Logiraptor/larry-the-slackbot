
.PHONY: copy

copy: main.gs
	cat main.gs | pbcopy
	echo "Copied main.gs to clipboard, please paste it into the apps script editor."

main.gs: main.js
	sed s/exports.*$$// main.js > main.gs

main.js: main.ts
	yarn run tsc -p .
