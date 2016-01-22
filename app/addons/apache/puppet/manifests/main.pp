if $apache == undef { $apache = hiera('apache') }
if $php == undef { $php = hiera('php', false) }

if ($apache['install'] == true) {

  class { 'apache':
    default_vhost => false,
    mpm_module => $apache['options']['mpm'], #prefork event or worker
    require => [
      Apt::Source['trusty_multiverse'],
      Apt::Source['trusty_multiverse_updates'],
      Exec['apt_update']
    ]
  }

  if $php != false {
    if $apache['options']['mpm'] == 'prefork' {
      class { "apache::mod::php": }
    } else {
      class { 'phpfpm':
        poold_purge => true,
      }

      # TCP pool using 127.0.0.1, port 9000, upstream defaults
      phpfpm::pool { 'www': }

      class { "apache::mod::fastcgi": }
      class { "apache::mod::actions": }
      apache::fastcgi::server { 'php':
        host       => '127.0.0.1:9000',
        timeout    => 3600,
        flush      => false,
        file_type  => 'application/x-httpd-php',
        require    => [
          Apache::Mod['actions'],
          Apache::Mod['fastcgi'],
          Class['phpfpm']
        ]
      }
    }
  }

  each( $apache['options']['modules'] ) |$module| {
    if ! defined(Apache::Mod[$module]) {
      class { "apache::mod::${module}": }
    }
  }

  each( $apache['options']['vhosts'] ) |$vhost| {

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
      ssl_certs_dir => $vhost['ssl_certs_dir'],
      custom_fragment => 'AddType application/x-httpd-php .php'
    }
  }
}
