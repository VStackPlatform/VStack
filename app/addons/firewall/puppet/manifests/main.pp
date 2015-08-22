if $firewall == undef { $firewall = hiera('firewall', false) }

class my_fw::pre {
  Firewall {
    require => undef,
  }

# Default firewall rules
  firewall { '000 accept all icmp':
    proto  => 'icmp',
    action => 'accept',
  }->
  firewall { '001 accept all to lo interface':
    proto   => 'all',
    iniface => 'lo',
    action  => 'accept',
  }->
  firewall { '002 accept related established rules':
    proto  => 'all',
    state  => ['RELATED', 'ESTABLISHED'],
    action => 'accept',
  }
}

class my_fw::post {
  firewall { '999 drop all':
    proto  => 'all',
    action => 'drop',
    before => undef,
  }
}

if $firewall and $firewall['install'] {

  Firewall {
    before  => Class['my_fw::post'],
    require => Class['my_fw::pre'],
  }

  class { ['my_fw::pre', 'my_fw::post']: }

  class { 'firewall': }

  each( $firewall['rules']['options'] ) |$key, $rule| {
    each( $rule['ports'] ) |$port| {
      if $rule['tcp'] and $rule['udp'] and $rule['icmp'] {
        firewall { "${rule['priority']}_${port}_${rule['action']}_all":
          port   => $port,
          proto  => 'all',
          action => $rule['action'],
        }
      } else {
        if $rule['tcp'] {
          firewall { "${rule['priority']}_${port}_${rule['action']}_tcp":
            port   => $port,
            proto  => 'tcp',
            action => $rule['action'],
          }
        }

        if $rule['udp'] {
          firewall { "${rule['priority']}_${port}_${rule['action']}_udp":
            port   => $port,
            proto  => 'udp',
            action => $rule['action'],
          }
        }

        if $rule['icmp'] {
          firewall { "${rule['priority']}_${port}_${rule['action']}_icmp":
            port   => $port,
            proto  => 'icmp',
            action => $rule['action'],
          }
        }
      }
    }
  }
}

