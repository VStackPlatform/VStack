#!/usr/bin/env bash
apt-get update --fix-missing
apt-get install --assume-yes ruby-dev git #required for librarian-puppet but not installed.
gem install librarian-puppet -v 2.0.1

if [ ! -d ~/.vstack ]; then
    mkdir ~/.vstack
fi

# if puppet file has changed or does not exist run librarian.
puppetMD5=($(md5sum /vagrant/manifests/Puppetfile))
if [ -f ~/.vstack/puppetmd5 ]; then
    echo "Puppetfile old MD5 $puppetMD5"
    echo "Puppetfile new MD5 "$(cat ~/.vstack/puppetmd5)
fi
if [ ! -f ~/.vstack/puppetmd5 ] || ! grep -Fxq $puppetMD5 ~/.vstack/puppetmd5; then
    echo $puppetMD5 > ~/.vstack/puppetmd5;
    cd /vagrant/manifests/
    rm -rf modules/*
    librarian-puppet install --verbose
fi



