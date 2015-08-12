if $projectName == undef { $projectName = hiera('projectName') }
if $nodejs == undef { $nodejs = hiera('nodejs', false) }

class { 'bash':
  config_file_template => "bash/${::lsbdistcodename}/etc/skel/bashrc.erb",
  config_file_hash     => {
    '.bash_aliases_skel' => {
      config_file_path   => '/etc/skel/.bash_aliases',
      config_file_template => '/vagrant/files/skel/bash_aliases.erb'
    },
    '.bash_aliases_root' => {
      config_file_path   => '/root/.bash_aliases',
      config_file_template => '/vagrant/files/skel/bash_aliases.erb'
    },
    '.bash_aliases_vagrant' => {
      config_file_path   => '/home/vagrant/.bash_aliases',
      config_file_template => '/vagrant/files/skel/bash_aliases.erb'
    },
    '.bashrc'            => {
      config_file_path     => '/root/.bashrc',
      config_file_template => "bash/${::lsbdistcodename}/etc/skel/bashrc.erb",
    }
  }
}
