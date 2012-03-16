#!/usr/bin/env jasy

import shutil, json

dist = "build"

# Configure fields
session.setField("es5", True)
session.permutateField("debug")

formatting = Formatting('semicolon', 'comma')


@task
def clean():
    logging.info("Clearing cache...")
    session.clearCache()


@task
def distclean():
    logging.info("Clearing cache...")
    session.clearCache()

    if os.path.exists(dist):
        logging.info("Deleting build folder...")
        shutil.rmtree(dist)


@task
def build(dist="build"):
    
    # Write kernel script
    resolver = Resolver()
    resolver.addClassName("api.Browser")
    assets = Asset(resolver.getIncludedClasses()).exportBuild()
    includedByKernel = storeKernel("%s/script/kernel.js" % dist, assets=assets, debug=False)

    # Copy files from source
    updateFile("source/index.html", "%s/index.html" % dist)

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        writeFile("%s/tmpl/%s.js" % (dist, tmpl), "apibrowser.callback(%s, '%s.mustache')" % (jsonTemplate, tmpl))
        
    # Process every possible permutation
    for permutation in session.permutate():
        
        # Resolving dependencies
        resolver = Resolver()
        resolver.addClassName("api.Browser")
        resolver.excludeClasses(includedByKernel)

        # Compressing classes
        classes = Sorter(resolver).getSortedClasses()
        compressedCode = storeCompressed("%s/script/browser-%s.js" % (dist, getPermutation().getChecksum()), classes, bootCode="apibrowser=new api.Browser();")

    # Write API data
    writer = ApiWriter().write("%s/data" % dist, compact=False, callback="apibrowser.callback")



@task
def source():
    dist = "source"

    # Prepare assets
    resolver = Resolver()
    resolver.addClassName("api.Browser")
    assets = Asset(resolver.getIncludedClasses()).exportSource()

    # Write kernel script
    includedByKernel = storeKernel("%s/script/kernel.js" % dist, assets=assets, formatting=formatting, debug=True)

    # Rewrite template as jsonp
    for tmpl in ["main", "error", "entry", "type", "params", "info", "origin", "tags"]:
        jsonTemplate = json.dumps({ "template" : open("source/tmpl/%s.mustache" % tmpl).read() })
        writeFile("%s/tmpl/%s.js" % (dist, tmpl), "apibrowser.callback(%s, '%s.mustache')" % (jsonTemplate, tmpl))

    # Process every possible permutation
    for permutation in session.permutate():

        # Resolving dependencies
        resolver = Resolver(permutation)
        resolver.addClassName("api.Browser")
        resolver.excludeClasses(includedByKernel)

        # Compressing classes
        classes = Sorter(resolver, permutation).getSortedClasses()
        compressedCode = storeSourceLoader("%s/script/browser-%s.js" % (dist, permutation.getChecksum()), classes, bootCode="apibrowser=new api.Browser();")

    # Write API data
    writer = ApiWriter().write("%s/data" % dist, compact=False, callback="apibrowser.callback")


