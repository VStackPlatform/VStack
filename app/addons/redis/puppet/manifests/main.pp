if $redis == undef { $redis = hiera('redis') }

if $redis['install'] == true {
  class { 'redis::install': }
  redis::server {
    'instance1':
      redis_port      => $redis['options']['port']
  }
}