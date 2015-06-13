if $nodejs == undef { $nodejs = hiera('nodejs') }

$nvmInstall = '/usr/local/nvm'
$home = '/root'
$version = $nodejs['version']

if ! defined(Package['curl']) {
  package { 'curl':
    ensure => present,
  }
}

# Install NVM to manage nodejs installations.
exec{ 'nvm_install':
  command => "/usr/bin/curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | NVM_DIR=${nvmInstall} bash",
  creates => "${nvmInstall}/.nvm/nvm.sh",
  unless => "/usr/bin/test -e ${nvmInstall}/nvm.sh",
  environment => [ "HOME=${home}" ],
}

# Install the specified version.
exec{ 'nodejs_install':
  command => sprintf('. %s/nvm.sh && nvm install %s', $nvmInstall, $nodejs['version']),
  cwd => $home,
  provider    => shell,
  unless      => sprintf("/usr/bin/test -e %s/versions/node/v%s/bin/node", $nvmInstall, $nodejs['version']),
  environment => [ "HOME=${home}", "NVM_DIR=${nvmInstall}" ],
  require => Exec['nvm_install']
}

exec{ 'nodejs_default':
  command => sprintf('. %s/nvm.sh && nvm alias default %s', $nvmInstall, $nodejs['version']),
  cwd => $home,
  provider    => shell,
  unless      => "/usr/bin/test -e ${nvmInstall}/alias/default",
  environment => [ "HOME=${home}", "NVM_DIR=${nvmInstall}" ],
  require => Exec['nodejs_install']
}

## Install NPM modules.
each( $nodejs['npm'] ) |$module| {
  exec{ sprintf('npm_install_%s', $module):
    command => sprintf('%s/versions/node/v%s/bin/npm install -g %s', $nvmInstall, $version, $module),
    unless => sprintf('%s/versions/node/v%s/bin/npm list -g %s', $nvmInstall, $version, $module),
    require => Exec['nodejs_default']
  }
}