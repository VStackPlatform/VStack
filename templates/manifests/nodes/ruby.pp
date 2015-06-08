if $ruby == undef { $ruby = hiera('ruby', false) }

## install key until fixed in class.
exec { 'fetch_rvm_key':
  command => '/usr/bin/curl -#LO https://rvm.io/mpapis.asc',
  cwd => '/root',
  unless => "/usr/bin/test -f /root/mpapis.asc",
  before => Class['rvm::gnupg_key']
}

exec { 'install_rvm_key':
  command => '/usr/bin/gpg --import /root/mpapis.asc',
  cwd => '/root',
  require => Exec['fetch_rvm_key'],
  before => Class['rvm::gnupg_key']
}

## Install rvm for ruby management.
class { '::rvm': }

## make vagrant user a default user.
rvm::system_user { vagrant: }

if $ruby != false {
  each( $ruby['gems'] ) |$module| {
    exec { $module:
      command => sprintf('/usr/bin/gem install %s', $module),
      require => Class['::rvm']
    }
  }
}

