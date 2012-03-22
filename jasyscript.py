# API Browser
# Copyright 2012 Zynga Inc.

import json

session.setField("es5", True)
session.permutateField("debug")


@task("Clear build cache")
def clean():
    session.clearCache()


@task("Clear caches and build results")
def distclean():
    session.clearCache()
    removeDir("build")
    removeDir("source/script")
    removeDir("source/data")


@task("Build the full api viewer into api folder")
def api():
    build(prefix="api")
    ApiWriter().write("data")


@task("Build the API viewer application")
def build():
    
    # Write kernel script
    asset = Asset(Resolver().addClassName("apibrowser.Browser").getIncludedClasses())
    includedByKernel = storeKernel("script/kernel.js", assets=asset.exportBuild())

    # Copy files from source
    updateFile("source/index.html", "index.html")

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        writeFile("tmpl/%s.js" % tmpl, "apiload(%s, '%s.mustache')" % (jsonTemplate, tmpl))
        
    # Process every possible permutation
    for permutation in session.permutate():
        
        # Resolving dependencies
        resolver = Resolver().addClassName("apibrowser.Browser").excludeClasses(includedByKernel)

        # Compressing classes
        storeCompressed("script/browser-%s.js" % permutation.getChecksum(), Sorter(resolver).getSortedClasses(), bootCode="new apibrowser.Browser;")


@task("Generate source")
def source():

    # Write kernel script
    asset = Asset(Resolver().addClassName("apibrowser.Browser").getIncludedClasses())
    includedByKernel = storeKernel("script/kernel.js", assets=asset.exportSource())

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        writeFile("tmpl/%s.js" % tmpl, "apiload(%s, '%s.mustache')" % (jsonTemplate, tmpl))

    # Process every possible permutation
    for permutation in session.permutate():

        # Resolving dependencies
        resolver = Resolver().addClassName("apibrowser.Browser").excludeClasses(includedByKernel)

        # Building class loader
        storeSourceLoader("script/browser-%s.js" % permutation.getChecksum(), Sorter(resolver).getSortedClasses(), bootCode="new apibrowser.Browser;")

    # Generate API data into source folder
    ApiWriter().write("data")
