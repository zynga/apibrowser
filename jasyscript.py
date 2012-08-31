# API Browser
# Copyright 2012 Zynga Inc.

import json

session.permutateField("es5")
session.permutateField("debug")


@task("Clear build cache")
def clean():
    session.clean()


@task("Clear caches and build results")
def distclean():
    session.clean()
    removeDir("build")
    removeDir("external")
    removeDir("source/script")
    removeDir("source/data")


@task("Build the full api viewer into api folder")
def api():
    build(prefix="api")
    ApiWriter().write("data")


@task("Build the API viewer application")
def build(theme="original"):

    session.setField("theme", theme)

    # Configure assets for being loaded from local asset folder
    assetManager.deploy(Resolver().addClassName("apibrowser.Browser").getIncludedClasses())
    assetManager.addBuildProfile()
    
    # Write kernel script
    includedByKernel = storeKernel("script/kernel.js")

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
        storeCompressed(resolver.getSortedClasses(), "script/browser-%s.js" % permutation.getChecksum(), "new apibrowser.Browser;")


@task("Generate source")
def source(theme="original"):
    
    session.setField("theme", theme)

    # Configure assets for being loaded from source folders
    assetManager.addSourceProfile()

    # Write kernel script
    includedByKernel = storeKernel("script/kernel.js", debug=True)

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        writeFile("tmpl/%s.js" % tmpl, "apiload(%s, '%s.mustache')" % (jsonTemplate, tmpl))

    # Process every possible permutation
    for permutation in session.permutate():

        # Resolving dependencies
        resolver = Resolver().addClassName("apibrowser.Browser").excludeClasses(includedByKernel)

        # Building class loader
        storeLoader(resolver.getSortedClasses(), "script/browser-%s.js" % permutation.getChecksum(), "new apibrowser.Browser;")

    # Generate API data into source folder
    ApiWriter().write("data")

@task
def server(host='127.0.0.1'):
    """Start HTTP server"""

    if jasy.__version__ < '0.8-beta1':
        error("To use the built-in HTTP server, you need a jasy version >= 0.8. Please upgrade!")
        return
    
    serve(host=host)

