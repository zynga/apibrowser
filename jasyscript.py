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
    ApiWriter(session).write("data")


@task
def build(theme="original"):
    """Build the API viewer application"""

    # Configure fields
    session.permutateField("es5")
    session.setField("debug", False)

    # Pass theme into client code
    session.setField("theme", theme)

    # Configure assets for being loaded from local asset folder
    session.getAssetManager().deploy(Resolver(session).addClassName("apibrowser.Browser").getIncludedClasses())
    session.getAssetManager().addBuildProfile()
    
    # Write kernel script
    includedByKernel = Output(session).storeKernel("script/kernel.js")

    # Copy files from source
    File.updateFile("source/index.html", "index.html")
    
    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        File.writeFile("tmpl/%s.js" % tmpl, "apiload(%s, '%s.mustache')" % (jsonTemplate, tmpl))
        
    # Process every possible permutation
    for permutation in session.permutate():
        
        # Resolving dependencies
        resolver = Resolver(session).addClassName("apibrowser.Browser").excludeClasses(includedByKernel)

        # Compressing classes
        Output(session).storeCompressed(resolver.getSortedClasses(), "script/browser-%s.js" % permutation.getChecksum(), "new apibrowser.Browser;")


@task
def source(theme="original"):
    """Generate source"""

    # Configure fields
    session.permutateField("es5")
    session.permutateField("debug")
    
    # Pass theme into client code
    session.setField("theme", theme)

    # Configure assets for being loaded from source folders
    session.getAssetManager().addSourceProfile()

    # Write kernel script
    includedByKernel = Output(session).storeKernel("script/kernel.js", debug=True)

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        File.writeFile("tmpl/%s.js" % tmpl, "apiload(%s, '%s.mustache')" % (jsonTemplate, tmpl))

    # Process every possible permutation
    for permutation in session.permutate():

        # Resolving dependencies
        resolver = Resolver(session).addClassName("apibrowser.Browser").excludeClasses(includedByKernel)

        # Building class loader
        Output(session).storeLoader(resolver.getSortedClasses(), "script/browser-%s.js" % permutation.getChecksum(), "new apibrowser.Browser;")

    # Generate API data into source folder
    ApiWriter(session).write("data")


