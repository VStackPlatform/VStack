#!/usr/bin/env bash

dpkg-query -s puppet > /dev/null 2>&1
PUPPET_INSTALLED=$?
PUPPET_VERSION='3.4.3' #set default version to prompt upgrade if puppet not installed.
ENVIRONMENT=$1

if [ $PUPPET_INSTALLED -eq 0 ]; then
    PUPPET_VERSION=`/usr/bin/puppet --version`
fi

PUPPET_RELEASE="$(echo $PUPPET_VERSION | head -c 3)"

if [ $PUPPET_INSTALLED -ne 0 ] || [ $PUPPET_RELEASE != "3.8" ]; then
    #install requirements for puppet upgrade.
    dpkg-query -s lsb-release > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        apt-get install --assume-yes lsb-release
    fi
    dpkg-query -s wget > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        apt-get install --assume-yes wget
    fi

    DISTRIB_CODENAME=$(lsb_release --codename --short)
    DEB="puppetlabs-release-${DISTRIB_CODENAME}.deb"
    DEB_PROVIDES="/etc/apt/sources.list.d/puppetlabs.list" # Assume that this file's existence means we have the Puppet Labs repo added

    if [ ! -e $DEB_PROVIDES ]; then
        # Print statement useful for debugging, but automated runs of this will interpret any output as an error
        # print "Could not find $DEB_PROVIDES - fetching and installing $DEB"
        wget -q http://apt.puppetlabs.com/$DEB
        sudo dpkg -i $DEB
    fi
fi

# run update before anything why? because repos always get out of date...
apt-get update --fix-missing

#required if puppet not installed (Digital Ocean)
if [ $PUPPET_INSTALLED -ne 0 ] || [ $PUPPET_RELEASE != "3.8" ]; then
    apt-get install --assume-yes puppet
fi

#required for librarian-puppet but not installed.
dpkg-query -s git > /dev/null 2>&1
if [ $? -ne 0 ]; then
    apt-get install --assume-yes git
fi
dpkg-query -s ruby-dev > /dev/null 2>&1
if [ $? -ne 0 ]; then
    apt-get install --assume-yes ruby-dev
fi
dpkg-query -s build-essential > /dev/null 2>&1
if [ $? -ne 0 ]; then
    apt-get install --assume-yes build-essential
fi

gem list -i librarian-puppet > /dev/null 2>&1
if [ $? -ne 0 ]; then
    gem install librarian-puppet -v 2.2.1
fi

if [ ! -d ~/.vstack ]; then
    mkdir -p ~/.vstack/modules
fi

# if puppet file has changed or does not exist run librarian.
puppetMD5=($(md5sum /vagrant/puppet/Puppetfile))
if [ -f ~/.vstack/puppetmd5 ]; then
    echo "Puppetfile old MD5 $puppetMD5"
    echo "Puppetfile new MD5 "$(cat ~/.vstack/puppetmd5)
fi

#if first run, puppetfile has been updated or librarian did not complete reinstall modules.
if [ ! -f ~/.vstack/puppetmd5 ] || ! grep -Fxq $puppetMD5 ~/.vstack/puppetmd5 || [ -f ~/.vstack/install_running ]; then
    echo $puppetMD5 > ~/.vstack/puppetmd5
    echo "" > ~/.vstack/install_running
    if  [ $ENVIRONMENT != 'local' ]; then
        cd ~/.vstack/
        cp /vagrant/puppet/Puppetfile ~/.vstack/
    else
        cd /vagrant/puppet
    fi
    rm -rf modules/*
    librarian-puppet install --verbose
    if [ $? -eq 1 ];then
        exit 1
    fi
    rm -rf ~/.vstack/install_running
fi



