if $php == undef { $php = hiera('php') }

class { 'composer':
  github_token => $php['composer_options']['github_token'],
  require => Class['apt'],
  suhosin_enabled => false
}