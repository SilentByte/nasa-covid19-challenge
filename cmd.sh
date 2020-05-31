#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
COMMAND=$1

command_help() {
    cat << USAGE
  Usage: ./cmd.sh <command> [options]

  Commands:
    dev             Start a local development server
    dev-fast        Start a local development server, w/o npm install

    build           Build the entire project
    deploy          Build and deploy the entire project

USAGE
}

command_dev() {
    npm install
    npm run dev
}

command_dev_fast() {
    npm run dev
}

command_build() {
    npm install
    npm run build
}

command_deploy() {
    command_build
    firebase deploy
}

case "$COMMAND" in
    "dev")
        command_dev
        ;;

    "dev-fast")
        command_dev_fast
        ;;

    "build")
        command_build
        ;;

    "deploy")
        command_deploy
        ;;

    *)
        command_help
        ;;
esac