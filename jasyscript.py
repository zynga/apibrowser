#!/usr/bin/env jasy

import shutil, json

dist = "build"


session = Session()
session.addProject(Project("../core/"))
session.addProject(Project("."))

# Configure permutations
session.setField("es5", True)
session.permutateField("debug")

# Optimizer configuration
optimization = Optimization("variables", "declarations", "blocks", "privates")



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
def build():
    dist = "build"
    
    # Write API data
    writer = ApiWriter(session)
    writer.write("%s/data" % dist, callback="apibrowser.callback")

    # Prepare assets
    resolver = Resolver(session.getProjects())
    resolver.addClassName("api.Browser")
    assets = Asset(session, resolver.getIncludedClasses()).exportBuild()
    formatting = Formatting('semicolon', 'comma')

    # Write kernel script
    includedByKernel = storeKernel("%s/script/kernel.js" % dist, session, assets=assets, formatting=formatting, debug=True)

    # Copy files from source
    updateFile("source/index.html", "%s/index.html" % dist)

    # Rewrite template as jsonp
    jsonTemplate = json.dumps({ "template" : open("source/template.mustache").read() })
    writeFile("%s/data/$template.jsonp" % dist, "apibrowser.callback(%s, '$template')" % jsonTemplate)

    # Process every possible permutation
    for permutation in session.getPermutations():

        # Resolving dependencies
        resolver = Resolver(session.getProjects(), permutation)
        resolver.addClassName("api.Browser")
        resolver.excludeClasses(includedByKernel)

        # Compressing classes
        classes = Sorter(resolver, permutation).getSortedClasses()
        compressedCode = storeCompressed("%s/script/browser-%s.js" % (dist, permutation.getChecksum()), classes,
            permutation=permutation, optimization=optimization, formatting=formatting, bootCode="apibrowser=new api.Browser();")


