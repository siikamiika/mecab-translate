#!/usr/bin/env python3

import re

output = []

with open('JMdict_e', 'rb') as f:
    for line in f:
        if line.startswith(b'<!ENTITY'):
            line = re.sub(b'<!ENTITY (.*?) "(.*?)"', b'<!ENTITY \\1 "\\1"', line)
        output.append(line)

with open('JMdict_e', 'wb') as f:
    f.write(b''.join(output))
