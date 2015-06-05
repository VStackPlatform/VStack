#!/usr/bin/env bash

SCRIPT_PATH=/vagrant/scripts/exec-once/

if [ ! -f ~/.puppet-install/exec-once ]; then
    if [ ! -d ~/.puppet-install ]; then
        mkdir ~/.puppet-install
    fi
    echo "$(date +"%T")" > ~/.puppet-install/exec-once;
    if [ "$(ls -A ${SCRIPT_PATH})" ]; then
        for SCRIPT in "${SCRIPT_PATH}/*"
        do
            chmod +x $SCRIPT
            if [ -f $SCRIPT -a -x $SCRIPT ]
            then
                bash $SCRIPT
            fi
        done
	fi
fi