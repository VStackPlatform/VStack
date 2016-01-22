if $git == undef { $git = hiera('git', false) }

each( $git['options']['repos']) |$repo| {
  exec {"/usr/bin/git clone https://${git['options']['token']}@${repo['remote']} ${repo['path']}":

  }
}