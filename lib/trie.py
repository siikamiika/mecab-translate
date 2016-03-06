class Trie(object):

    def __init__(self):

        self._tree = dict()


    def insert(self, key, value):

        pos = self._tree

        for char in key:
            if pos.get(char) is not None:
                pos = pos[char]
            else:
                pos[char] = dict()
                #pos[char][-1] = pos # parent
                pos = pos[char]

        pos[0] = value


    def get(self, key, exact=True):

        pos = self._tree
        shorter = False

        for char in key:
            try:
                pos = pos[char]
            except KeyError:
                if exact:
                    return
                shorter = True
                break

        if exact:
            return pos.get(0)

        if pos == self._tree:
            return

        results = dict(exact=None, shorter=None, longer=[])

        if shorter:
            results['shorter'] = pos.get(0)
            return results
        else:
            results['exact'] = pos.get(0)

        def recurse_trie(tree, first=False):
            for k in tree:
                if k == 0:
                    if first:
                        continue
                    try:
                        results['longer'].index(tree[k])
                    except ValueError:
                        results['longer'].append(tree[k])
                elif k != -1:
                    recurse_trie(tree[k])

        recurse_trie(pos, True)

        return results
