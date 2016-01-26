if $nodejs == undef { $nodejs = hiera('nodejs') }

if $nodejs['install'] == true {

  $version = $nodejs['options']['version']

  if ! defined(Package['curl']) {
    package { 'curl':
      ensure => present,
    }
  }

  class { 'nvm':
    users => ['vagrant']
  }

  class { 'nvm::nodejs': }

  nvm::nodejs::install{ "node_js_$version":
    version     => $version,
    set_default  => true
  }

  class { 'nvm::npm':
    node_version => $version,
  }

  nvm::npm::add_modules{ 'npm_global_modules':
    modules   => $nodejs['options']['npm']
  }

}