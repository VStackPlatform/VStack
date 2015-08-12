if $nginx == undef { $nginx = hiera('nginx') }

if $nginx['install'] == true {
  include nginx
  each( $nginx['options']['sites'] ) |$site| {
    nginx::site { $site['site_name']: }

    each( $site['upstreams'] ) |$upstream| {
      nginx::upstream { $upstream['upstream_name']:
        site => Nginx::Site[$site['site_name']],
        directives => $upstream['directives']
      }
    }

    each( $site['servers'] ) |$server| {
      $listen = regsubst($server['listen'], '[^a-z0-9]+', '-')
      $server_name = sprintf("%s-%s", $server['server_name'], $listen)
      nginx::server { $server_name:
        site => Nginx::Site[$site['site_name']],
        directives => $server['directives']
      }
      each( $server['locations'] ) |$key, $location| {
        nginx::server::location { sprintf("%s-%s", $server_name, $key):
          location => $location['path'],
          site => Nginx::Site[$site['site_name']],
          server   => Nginx::Server[$server_name],
          directives  => $location['directives']
        }
      }
    }
  }
}