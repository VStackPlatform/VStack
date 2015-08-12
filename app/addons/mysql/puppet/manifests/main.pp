if $mysql == undef { $mysql = hiera('mysql') }

if $mysql['install'] == true {
  ## Workaround for ubuntu 14.04
  ## @todo remove when better solution is found.
  case $mysql['options']['version'] {
    '5.5': {
      if file_exists('/var/lib/mysql/debian-5.6.flag') {
        file { 'remove_debian_flag':
          ensure => "absent",
          path   => '/var/lib/mysql/debian-5.6.flag',
          purge  => true,
          force  => true,
        }
        package { "mysql-client-core-5.5":
          ensure => "present"
        }
        package { "mysql-client-5.5":
          ensure => "present"
        }
      }
    }
    '5.6': {
      if file_exists('/var/lib/mysql/debian-5.5.flag') {
        file { 'remove_debian_flag':
          ensure => "absent",
          path   => '/var/lib/mysql/debian-5.5.flag',
          purge  => true,
          force  => true,
        }
        package { "mysql-client-core-5.6":
          ensure => "present"
        }
        package { "mysql-client-5.6":
          ensure => "present"
        }
      }
    }
  }

  class { '::mysql::server':
    root_password => $mysql['options']['root_password'],
    package_name => sprintf("%s%s", 'mysql-server-', $mysql['options']['version'])
  }

  each( $mysql['options']['users'] ) |$user| {
    mysql_user{ sprintf("%s@%s", $user['username'], $user['host']):
      ensure        => present,
      password_hash => mysql_password($user['password']),
      require       => Class['mysql::server']
    }
  }

  each( $mysql['options']['databases'] ) |$database| {
    mysql_database{ $database:
      ensure => 'present',
      charset => 'utf8',
      collate => 'utf8_swedish_ci',
      require => Class['mysql::server'],
    }
  }

  each( $mysql['options']['grants'] ) |$grant| {
    mysql_grant{ sprintf("%s/%s.%s", $grant['username'], $grant['database'], $grant['table']):
      user       => $grant['username'],
      table      => sprintf("%s.%s", $grant['database'], $grant['table']),
      privileges => $grant['privileges'],
      require => Class['mysql::server'],
    }
  }
}
else {
  package { "mysql-client-core-5.5":
    ensure => absent
  }
  package { "mysql-client-5.5":
    ensure => absent
  }
}

