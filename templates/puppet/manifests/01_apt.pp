class { 'apt': }

## for fastcgi
apt::source { 'trusty_multiverse':
  location => 'http://archive.ubuntu.com/ubuntu',
  release => 'trusty',
  repos => 'multiverse'
}

apt::source { 'trusty_multiverse_updates':
  location => 'http://archive.ubuntu.com/ubuntu',
  release => 'trusty-updates',
  repos => 'multiverse'
}