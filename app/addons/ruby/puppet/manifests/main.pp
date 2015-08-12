if $ruby == undef { $ruby = hiera('ruby', false) }

if $ruby['install'] == true {
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
    unless => '/usr/bin/gpg --list-keys D39DC0E3',
    before => Class['rvm::gnupg_key']
  }

  ## Install rvm for ruby management.
  class { '::rvm': }

  ## make vagrant user a default user.
  rvm::system_user { vagrant: }

  if $ruby != false {
    each( $ruby['options']['gems'] ) |$module| {
      exec { $module:
        command => sprintf('/usr/bin/gem install %s', $module),
        require => Class['::rvm'],
        unless => sprintf('/usr/bin/gem list -i %s', $module)
      }
    }
  }

  each( $ruby['options']['versions'] ) |$module| {
    rvm_system_ruby { $module['version']:
      ensure      => 'present',
      default_use => false
    }
    each( $module['gems'] ) |$gem| {
      rvm_gem { sprintf('%s/%s', $module['version'], $gem):
        name => $gem,
        ruby_version => $module['version'],
        ensure  => 'present'
      }
    }
  }
}


