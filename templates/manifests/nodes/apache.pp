if $apache == undef { $apache = hiera('apache') }

class { 'apache':
  default_vhost => true,
  mpm_module => 'prefork',
  require => Class['apt'],
}

each( $apache['modules'] ) |$module| {
  class { "apache::mod::${module}": }
}

each( $apache['vhosts'] ) |$vhost| {

  apache::vhost { $vhost['name']:
    port    => $vhost['port'],
    docroot => $vhost['docroot'],
    serveraliases => $vhost['serveraliases'],
    aliases => $vhost['aliases'],
    setenv => $vhost['setEnv'],
    directories => $vhost['directories'],
    ssl      => $vhost['ssl'],
    ssl_cert => $vhost['ssl_cert'],
    ssl_key  => $vhost['ssl_key'],
    ssl_chain => $vhost['ssl_chain'],
    ssl_certs_dir => $vhost['ssl_certs_dir']
  }
}