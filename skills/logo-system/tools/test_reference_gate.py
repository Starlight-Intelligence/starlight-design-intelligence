import hashlib
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from PIL import Image

from reference_gate import verify


class ReferenceGateTest(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / "mark.png"
        Image.new("RGB", (16, 24), "red").save(self.source)
        self.sha = hashlib.sha256(self.source.read_bytes()).hexdigest()
        self.catalog = {"source:historical": self.sha}
        self.job = {"brand": "fixture", "tier": "essential", "stage": "generation",
                    "visual_reviewer": "Director", "geometry_invariants": ["open counter"],
                    "anchors": [{"file": "mark.png", "source": "source:historical", "source_class": "source-file", "sha256": self.sha}],
                    "conditioned_files": ["mark.png"]}

    def test_valid_generation(self):
        self.assertEqual(verify(self.job, self.root, self.catalog)["source_manifest"], "matched")

    def test_substitution_even_when_job_hash_is_rewritten(self):
        Image.new("RGB", (16, 24), "blue").save(self.source)
        self.job["anchors"][0]["sha256"] = hashlib.sha256(self.source.read_bytes()).hexdigest()
        with self.assertRaises(ValueError):
            verify(self.job, self.root, self.catalog)

    def test_separate_catalog_for_generation(self):
        with self.assertRaises(ValueError):
            verify(self.job, self.root)

    def test_reviewer_alias(self):
        self.job.update(stage="comparison", independent_critique={"reviewer":"  DIRECTOR ", "finding":"counter closes"})
        with self.assertRaises(ValueError):
            verify(self.job, self.root)

    def test_empty_visual(self):
        self.source.write_bytes(b"\xff\xd8\xff")
        with self.assertRaises((OSError, ValueError)):
            verify(self.job, self.root, self.catalog)


if __name__ == "__main__":
    unittest.main()
