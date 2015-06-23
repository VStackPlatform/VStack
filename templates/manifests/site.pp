## Create first and last stages for easier maintenance.
stage { 'first':
  before => Stage['main'],
}
stage { 'last': }
Stage['main'] -> Stage['last']

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

import 'nodes/*.pp'

