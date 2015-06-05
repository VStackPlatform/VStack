if $php == undef { $php = hiera('php') }
$phpIni = '/etc/php5/apache2/conf.d/vstack.ini'

package { 'augeas-tools':
  ensure => installed
}

## add repo for required PHP version.
case $php['version'] {
  '5.4': {
    apt::ppa{ 'ppa:ondrej/php5-oldstable': }
  }
  '5.5': {
    apt::ppa{ 'ppa:ondrej/php5': }
  }
  '5.6': {
    apt::ppa{ 'ppa:ondrej/php5-5.6': }
  }
}

file { $phpIni:
  replace => "yes",
  ensure => 'present'
}

class { 'php':
  require => Class['apt'],
}

if $php['xdebug'] == true {
  php::module { 'xdebug':
    module_prefix => "php5-", #All php packages are prefixed by php5 in ubuntu.
  }
  each( $php['xdebug_options']['settings'] ) |$key, $setting| {
    php::augeas { $key:
      entry       => "XDEBUG/${key}",
      value       => $setting,
      target      => '/etc/php5/apache2/conf.d/20-xdebug.ini'
    }
  }
}

## Install PHP modules.
each( $php['modules'] ) |$module| {
  php::module { $module:
    module_prefix => "php5-", #All php packages are prefixed by php5 in ubuntu.
  }
}

## Add INI settings.
each( $php['ini_settings'] ) |$key, $setting| {
  php::augeas { $key:
    entry       => "CUSTOM/${key}",
    value       => $setting,
    target      => $phpIni,
  }
}


