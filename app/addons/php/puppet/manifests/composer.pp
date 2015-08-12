if $php == undef { $php = hiera('php') }

class { 'composer':
  github_token => $php['options']['composer_options']['github_token'],
  suhosin_enabled => false
}