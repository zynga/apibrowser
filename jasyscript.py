#
# API Browser
# Copyright 2011-2012 Zynga Inc.
#

import json

@task
def clean():
    """Clear build cache"""

    session.clean()
    Repository.clean()


@task
def distclean():
    """Clear caches and build results"""

    session.clean()
    Repository.distclean()


@task
def api():
    """Build the full api viewer into api folder"""

    build(prefix="api")
    ApiWriter(session).write("$prefix/data")


@task
def build(theme="original"):
    """Build the API viewer application"""

    # Configure fields
    session.setField("debug", False)
    session.setField("theme", theme)
    session.permutateField("es5")

    # Initialize shared objects
    assetManager = AssetManager(session)
    assetManager.deploy(Resolver(session).addClassName("apibrowser.Browser").getIncludedClasses())
    assetManager.addBuildProfile()

    outputManager = OutputManager(session, assetManager, compressionLevel=2)
    fileManager = FileManager(session)

    # Write kernel script
    outputManager.storeKernel("$prefix/script/kernel.js", debug=True)

    # Copy files from source
    fileManager.updateFile("source/index.html", "$prefix/index.html")
    
    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        fileManager.writeFile("$prefix/tmpl/%s.js" % tmpl, "apiload(%s, '%s.mustache')" % (jsonTemplate, tmpl))
        
    # Process every possible permutation
    for permutation in session.permutate():
        
        # Resolving dependencies
        resolver = Resolver(session).addClassName("apibrowser.Browser")

        # Compressing classes
        outputManager.storeCompressed(resolver.getSortedClasses(), "$prefix/script/browser-$permutation.js", "new apibrowser.Browser;")


@task
def source(theme="original"):
    """Generate source"""

    # Configure fields
    session.setField("theme", theme)
    session.setField("debug", True)
    session.permutateField("es5")

    # Initialize shared objects
    assetManager = AssetManager(session)
    assetManager.addSourceProfile()

    outputManager = OutputManager(session, assetManager, compressionLevel=0)
    fileManager = FileManager(session)

    # Write kernel script
    outputManager.storeKernel("$prefix/script/kernel.js", debug=True)

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        fileManager.writeFile("$prefix/tmpl/%s.js" % tmpl, "apiload(%s, '%s.mustache')" % (jsonTemplate, tmpl))

    # Process every possible permutation
    for permutation in session.permutate():

        # Resolving dependencies
        resolver = Resolver(session).addClassName("apibrowser.Browser")

        # Building class loader
        outputManager.storeLoader(resolver.getSortedClasses(), "$prefix/script/browser-$permutation.js", "new apibrowser.Browser;")

    # Generate API data into source folder
    ApiWriter(session).write("$prefix/data")


@task
def server():
    """Starts built-in HTTP server"""

    Server().start()


