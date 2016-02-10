#!/usr/bin/env ruby

require 've'

words = Ve.in(:ja).words(ARGV[0])
puts JSON.generate(words.collect { |w| w.as_json })
