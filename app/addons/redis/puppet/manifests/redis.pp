if $redis == undef { $redis = hiera('redis') }

class { 'redis::install': }
redis::server {
  'instance1':
    redis_port      => $redis['port']
}