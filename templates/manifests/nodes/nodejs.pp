# Note the new setup script name for Node.js v0.12
exec{ 'nodejs_key':
  command => '/usr/bin/curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -'
}
exec{ 'nodejs_install':
  command => '/usr/bin/apt-get install -y nodejs',
  require => Class['apt'],
}
exec{ 'less_install':
  command => '/usr/bin/gem install sass'
}
