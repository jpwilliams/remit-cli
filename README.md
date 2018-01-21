# remit-cli
A CLI to perform basic remit actions

``` sh
npm install -g remit-cli
```

``` sh
$ remit-cli
  Commands:
    `help [command...]`
      Provides help for a given command.
   ` exit`
      Exits application.
    `remote <method> [origin] [url]`
      Caches rabbitmq urls for convenience; like git remote

      Options:

        --help  output usage information
    `request [options] <endpoint> [args...]`
      Makes a request to a remit endpoint

      Options:

        --help         output usage information
        -v, --verbose  Prints latency
        --json, --raw  Prints JSON rather than YAML
    `emit [options] <endpoint> [args...]`
      Listens for emits

      Options:

        --help         output usage information
        --json, --raw  Prints JSON rather than YAML

    `listen [options] <endpoint>`
      Options:

        --help         output usage information
        --json, --raw  Prints JSON rather than YAML

```

[![asciicast](https://asciinema.org/a/7QTBx2nEOkpvltjqdW7cu9Lbr.png)](https://asciinema.org/a/7QTBx2nEOkpvltjqdW7cu9Lbr)