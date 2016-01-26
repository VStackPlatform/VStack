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
      $server_id = sprintf("%s-%s", $server['server_name'], $listen)
      $directives = union($server['directives'], [
        "server_name ${server['server_name']}",
        "listen ${server['listen']}"
      ])
      nginx::server { $server_id:
        site => Nginx::Site[$site['site_name']],
        directives => $directives
      }
      each( $server['locations'] ) |$key, $location| {
        nginx::server::location { sprintf("%s-%s", $server_id, $key):
          location => $location['path'],
          site => Nginx::Site[$site['site_name']],
          server   => Nginx::Server[$server_id],
          directives  => $location['directives']
        }
      }
    }
  }
}

