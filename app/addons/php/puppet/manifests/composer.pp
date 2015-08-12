if $php == undef { $php = hiera('php') }
if $php['install'] {
  if $php['options']['composer'] == true {
    class { 'composer':
      github_token => $php['options']['composer_options']['github_token'] ? {
        "" => false,
        default => $php['options']['composer_options']['github_token']
      },
      suhosin_enabled => false
    }
  }
}