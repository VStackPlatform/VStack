if $php == undef { $php = hiera('php') }
if $apache == undef { $apache = hiera('apache', false) }
if $mysql == undef { $mysql = hiera('mysql', false) }

package { 'augeas-tools':
  ensure => installed
}

if $apache != false and $apache['mpm'] == 'prefork' {
  $phpPath = '/etc/php5/apache2/'
} elsif $apache != false {
  $phpPath = '/etc/php5/fpm/'
} else {
  $phpPath = '/etc/php5/cli/'
}

file { $phpPath:
  replace => "yes",
  ensure => 'present'
}

$phpIni = "${phpPath}/conf.d/vstack.ini"

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
  config_file => "${phpPath}/php.ini"
}

if $php['xdebug'] == true {
  php::module { 'xdebug':
    module_prefix => "php5-", #All php packages are prefixed by php5 in ubuntu.
  }
  each( $php['xdebug_options']['settings'] ) |$key, $setting| {
    php::augeas { $key:
      entry       => "XDEBUG/${key}",
      value       => $setting,
      target      => "${phpPath}/conf.d/20-xdebug.ini"
    }
  }
}

if $mysql != false {
  php::module { 'mysql':
    module_prefix => "php5-"
  }
}

## Install PHP modules.
each( $php['modules'] ) |$module| {
  php::module { $module:
    module_prefix => "php5-", #All php packages are prefixed by php5 in ubuntu.
  }
}

## Install PEAR modules.
each( $php['pear'] ) |$module| {
  php::pear::module { $module: }
}

## Install PECL modules.
each( $php['pecl'] ) |$module| {
  php::pecl::module { $module: }
}

## Add INI settings.
each( $php['ini_settings'] ) |$key, $setting| {
  php::augeas { $key:
    entry       => "CUSTOM/${key}",
    value       => $setting,
    target      => $phpIni,
  }
}


