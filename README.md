# remit-cli
A CLI to perform basic remit actions

``` sh
npm install -g remit-cli
```

``` sh
$ remit-cli

  Usage: remit-cli <target> [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -e, --emission             Emit
    -l, --listen               Listen
    -k, --keys [str]           Key/value pairs from the expand-object package
    -d, --data [json]          Data (overwrites -k)
    -f, --file [path]          Data file (overwrites -d)
    -n, --service-name [name]  Service name
    -u, --url [url]            RabbitMQ URL

```
