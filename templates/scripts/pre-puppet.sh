#!/usr/bin/env bash
apt-get update --fix-missing
apt-get install --assume-yes ruby-dev git #required for librarian-puppet but not installed.
gem install librarian-puppet -v 2.0.1
cd /vagrant/manifests/
rm -rf modules/*
librarian-puppet install --verbose
